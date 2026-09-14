from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import decode_access_token
from panchang_engine import get_panchang_for_date
from muhurt_rules import evaluate_muhurt_score

router = APIRouter(prefix="/api/predict", tags=["Prediction Engine"])


def deduct_user_credit_if_authenticated(request: Request, db: Session):
    """
    Checks if request is authenticated.
    If authenticated, verifies remaining trial credits in DB, decrements by 1, and saves to PostgreSQL.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            try:
                user_id = int(payload["sub"])
                user_credit = db.query(models.UserCredit).filter(models.UserCredit.user_id == user_id).first()
                if user_credit:
                    if user_credit.credits_remaining <= 0:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="You have 0 trial credits remaining. Please upgrade your plan or contact admin."
                        )
                    user_credit.credits_remaining -= 1
                    db.commit()
                    db.refresh(user_credit)
            except ValueError:
                pass


@router.post("/forecast", response_model=schemas.Best5DaysPredictionResultSchema)
def predict_forecast(
    req: schemas.ForecastRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Local high-performance date range forecast engine.
    Deducts 1 credit from logged in user's user_credits database record on execution.
    """
    deduct_user_credit_if_authenticated(request, db)

    try:
        start_dt = datetime.strptime(req.start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(req.end_date, "%Y-%m-%d")
        if end_dt < start_dt:
            end_dt = start_dt
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD."
        )

    # 1. Collect all dates in range
    days_count = (end_dt - start_dt).days + 1
    max_predictions = min(5, max(1, days_count))

    scored_days = []
    curr_dt = start_dt

    while curr_dt <= end_dt:
        d_str = curr_dt.strftime("%Y-%m-%d")
        panchang = get_panchang_for_date(d_str)
        evaluation = evaluate_muhurt_score(panchang, req.muhurt_type_id)

        scored_days.append({
            "dateISO": d_str,
            "formatted_date": curr_dt.strftime("%d %B %Y"),
            "panchang": panchang,
            "evaluation": evaluation
        })
        curr_dt += timedelta(days=1)

    # 2. Sort by auspiciousness score descending (Highest score first at Rank 1)
    scored_days.sort(key=lambda x: x["evaluation"]["score"], reverse=True)

    # 3. Select top N best days
    top_days = scored_days[:max_predictions]

    predictions = []
    for idx, item in enumerate(top_days):
        pan = item["panchang"]
        eval_res = item["evaluation"]
        limbs = eval_res["limb_evaluations"]
        ceremony = req.muhurt_name_en

        predictions.append(schemas.BestDayPredictionSchema(
            rank=idx + 1,
            date=item["formatted_date"],
            dateISO=item["dateISO"],
            tithi=pan["tithi"],
            nakshatra=pan["nakshatra"],
            vaar=pan["vaar"],
            yoga=pan["yoga"],
            karan=pan["karan"],
            auspiciousnessScore=eval_res["score"],
            verdict=eval_res["verdict"],
            overallAnalysis=f"This date aligns with favorable Vedic parameters for {ceremony}. Score: {eval_res['score']}%. Verdict: {eval_res['verdict']}.",
            tithiAnalysis=f"{pan['tithi']} — {limbs['tithi']}.",
            nakshatraAnalysis=f"{pan['nakshatra']} Nakshatra — {limbs['nakshatra']}.",
            vaarAnalysis=f"{pan['vaar']} — {limbs['vaar']}.",
            yogaAnalysis=f"{pan['yoga']} Yoga — {limbs['yoga']}.",
            karanAnalysis=f"{pan['karan']} Karan — {limbs['karan']}.",
            remedies=[
                f"Perform Lord Ganesha and Kula Devata invocations prior to starting {ceremony}.",
                "Place sacred Kalasha filled with pure water in North-East direction for positive energy."
            ]
        ))

    return {"predictions": predictions}


@router.post("/date")
def predict_single_date(
    req: schemas.SingleDateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Local single-date auto-Panchang calculator & Muhurt prediction.
    Deducts 1 credit from logged in user's user_credits database record on execution.
    """
    deduct_user_credit_if_authenticated(request, db)

    try:
        dt = datetime.strptime(req.target_date, "%Y-%m-%d")
        formatted_date = dt.strftime("%d %B %Y")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD."
        )

    panchang = get_panchang_for_date(req.target_date)
    eval_res = evaluate_muhurt_score(panchang, req.muhurt_type_id)
    limbs = eval_res["limb_evaluations"]

    return {
        "date": formatted_date,
        "tithi": panchang["tithi"],
        "nakshatra": panchang["nakshatra"],
        "vaar": panchang["vaar"],
        "yoga": panchang["yoga"],
        "karan": panchang["karan"],
        "auspiciousnessScore": eval_res["score"],
        "verdict": eval_res["verdict"],
        "overallAnalysis": f"Calculated Indian Panchang for {formatted_date} specifically for {req.muhurt_name_en}. Auspiciousness Score: {eval_res['score']}%. Verdict: {eval_res['verdict']}.",
        "tithiAnalysis": f"{panchang['tithi']} — {limbs['tithi']}.",
        "nakshatraAnalysis": f"{panchang['nakshatra']} Nakshatra — {limbs['nakshatra']}.",
        "vaarAnalysis": f"{panchang['vaar']} — {limbs['vaar']}.",
        "yogaAnalysis": f"{panchang['yoga']} Yoga — {limbs['yoga']}.",
        "karanAnalysis": f"{panchang['karan']} Karan — {limbs['karan']}.",
        "remedies": [
            f"Perform Lord Ganesha and Kula Devata invocations prior to starting {req.muhurt_name_en}.",
            "Place sacred Kalasha filled with pure water in North-East direction for positive energy."
        ]
    }
