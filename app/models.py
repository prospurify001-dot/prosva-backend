# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="customer")  # admin, restaurant, rider, customer

    # Orders where this user is the CUSTOMER
    customer_orders = relationship(
        "Order",
        foreign_keys="Order.customer_id",
        back_populates="customer"
    )

    # Orders where this user is the RIDER
    rider_orders = relationship(
        "Order",
        foreign_keys="Order.rider_id",
        back_populates="rider"
    )

    # Orders where this user is the RESTAURANT
    restaurant_orders = relationship(
        "Order",
        foreign_keys="Order.restaurant_id",
        back_populates="restaurant"
    )


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    item = Column(String)
    price = Column(Integer)
    status = Column(String, default="pending")  # pending, preparing, ready, delivered

    customer_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rider_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    customer = relationship(
        "User",
        foreign_keys=[customer_id],
        back_populates="customer_orders"
    )

    restaurant = relationship(
        "User",
        foreign_keys=[restaurant_id],
        back_populates="restaurant_orders"
    )

    rider = relationship(
        "User",
        foreign_keys=[rider_id],
        back_populates="rider_orders"
    )
