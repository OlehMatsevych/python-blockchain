from fastapi import FastAPI, HTTPException
from web3 import Web3, HTTPProvider
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from models import BalanceIn, BalanceOut, BalanceHistoryOut
import json

app = FastAPI()

INFURA_API_KEY = "PUT_YOUR_TOKEN"
CONTRACT_ABI = ""

w3 = Web3(HTTPProvider(f"https://mainnet.infura.io/v3/{INFURA_API_KEY}"))
CRV_CONTRACT_ADDRESS = "0xD533a949740bb3306d119CC777fa900bA034cd52"
client = AsyncIOMotorClient("mongodb://db:27017")
db = client["balances"]

with open("contract-abi.json", 'r') as file:
    data = json.load(file)
    CONTRACT_ABI = data

@app.post("/balance", response_model=BalanceOut)
async def get_balance(wallet: str):
    checksum_address = w3.to_checksum_address(wallet)

    # Get token balance from Ethereum
    contract = w3.eth.contract(address=CRV_CONTRACT_ADDRESS, abi=CONTRACT_ABI)
    balance = contract.functions.balanceOf(checksum_address).call()

    # Get token price in USD from CoinGecko
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.coingecko.com/api/v3/simple/price", params={"ids": "curve-dao-token", "vs_currencies": "usd"})
    price_usd = response.json()["curve-dao-token"]["usd"]

    balance_usd_str = sci_to_str(balance * price_usd)

    entry = {
        "wallet": wallet,
        "last_update_time": w3.eth.get_block("latest")["timestamp"],
        "current_balance": str(balance),
        "current_balance_usd": balance_usd_str,
        "history": [{"timestamp": w3.eth.get_block("latest")["timestamp"], "value": str(balance)}]
    }
    await db["balances"].update_one({"wallet": wallet}, {"$set": entry}, upsert=True)
    balance_out = BalanceOut(**entry)
    print("TEST:")
    print(balance_out.dict())
    return entry


@app.get("/history", response_model=BalanceHistoryOut)
async def get_balance_history(wallet: str):
    entry = await db["balances"].find_one({"wallet": wallet})
    if not entry:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    return entry


def sci_to_str(value: float) -> str:
    return "{:.10f}".format(value).rstrip('0').rstrip('.')