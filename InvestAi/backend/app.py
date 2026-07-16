from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, engine, Base
import models

app = FastAPI(title="InvestAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database tables are created (models imported above)
Base.metadata.create_all(bind=engine)


# Banco SQLite
DATABASE_URL = "sqlite:///./investai.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# Model moved to `models.py`


# Modelo recebido pela API
class Investimento(BaseModel):
    nome: str
    valor: float
    rendimento: float


# Abrir conexão com banco
# `get_db` provided by `database.get_db`


@app.get("/")
def inicio():
    return {
        "nome": "InvestAI",
        "status": "online"
    }


@app.post("/investimentos")
def adicionar_investimento(
    investimento: Investimento,
    db: Session = Depends(get_db)
):

    novo = models.InvestimentoDB(
        nome=investimento.nome,
        valor=investimento.valor,
        rendimento=investimento.rendimento
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return novo


@app.get("/carteira")
def ver_carteira(db: Session = Depends(get_db)):

    investimentos = db.query(models.InvestimentoDB).all()

    total_investido = sum(item.valor for item in investimentos)

    valor_atual = sum(
        item.valor * (1 + item.rendimento)
        for item in investimentos
    )

    lucro = valor_atual - total_investido

    investimentos_data = [
        {
            "id": item.id,
            "nome": item.nome,
            "valor": item.valor,
            "rendimento": item.rendimento,
            "quantidade": 1
        }
        for item in investimentos
    ]

    return {
        "quantidade": len(investimentos),
        "total_investido": total_investido,
        "valor_atual_estimado": round(valor_atual, 2),
        "lucro_estimado": round(lucro, 2),
        "investimentos": investimentos_data
    }


@app.delete("/investimentos/{item_id}")
def deletar_investimento(item_id: int, db: Session = Depends(get_db)):
    investimento = db.query(InvestimentoDB).filter(InvestimentoDB.id == item_id).first()
    if not investimento:
        raise HTTPException(status_code=404, detail="Investimento não encontrado")

    db.delete(investimento)
    db.commit()

    return {"mensagem": "Investimento excluído com sucesso!"}