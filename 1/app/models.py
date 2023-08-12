from pydantic import BaseModel
from typing import List, Dict

class BalanceIn(BaseModel):
    wallet: str

class BalanceOut(BaseModel):
    wallet: str
    last_update_time: int
    current_balance: str
    current_balance_usd: str
    history: List[Dict[str, int]]

class BalanceHistoryOut(BaseModel):
    wallet: str
    history: List[Dict[str, int]]
