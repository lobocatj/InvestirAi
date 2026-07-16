from sqlalchemy import Column, Integer, String, Float
from database import Base


class InvestimentoDB(Base):
    __tablename__ = "investimentos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    valor = Column(Float)
    rendimento = Column(Float)
