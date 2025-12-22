from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), index=True)
    visitor_id = Column(Integer, ForeignKey("users.id"))
    event_type = Column(String, index=True) # view, addtocart, transaction
    item_id = Column(Integer, ForeignKey("products.id"))
    transaction_id = Column(String, nullable=True)

    # Relationships
    user = relationship("User", backref="events")
    product = relationship("Product")
