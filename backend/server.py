from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET', 'gulum-mobilya-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[Dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[Dict]:
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload:
        return None
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    return user

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Non authentifié")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return user

# ============== MODELS ==============

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_fr: str
    name_tr: str
    name_en: str
    slug: str
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_fr: str
    name_tr: str
    name_en: str
    description_fr: str
    description_tr: str
    description_en: str
    price: float
    category_id: str
    images: List[str] = []
    stock: int = 0
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name_fr: str
    name_tr: str
    name_en: str
    description_fr: str
    description_tr: str
    description_en: str
    price: float
    category_id: str
    images: List[str] = []
    stock: int = 0
    featured: bool = False

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    items: List[Dict] = []
    total: float
    status: str = "pending"
    payment_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    cart_session_id: str

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    order_id: str
    amount: float
    currency: str = "eur"
    status: str = "pending"
    payment_status: str = "pending"
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

# ============== AUTH ==============

@api_router.post("/auth/register")
async def register(data: UserRegister):
    # Check if email exists
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    user = User(
        email=data.email.lower(),
        password=hash_password(data.password),
        name=data.name,
        phone=data.phone
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.email)
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_token(user["id"], user["email"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "phone": user.get("phone"),
            "address": user.get("address")
        }
    }

@api_router.get("/auth/me")
async def get_me(user: Dict = Depends(require_auth)):
    return user

@api_router.put("/auth/profile")
async def update_profile(data: UserUpdate, user: Dict = Depends(require_auth)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated_user

@api_router.get("/auth/orders")
async def get_my_orders(user: Dict = Depends(require_auth)):
    orders = await db.orders.find(
        {"user_id": user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders

# ============== CATEGORIES ==============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category: Category):
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

# ============== PRODUCTS ==============

@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if featured is not None:
        query["featured"] = featured
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============== CART ==============

@api_router.get("/cart/{session_id}")
async def get_cart(session_id: str):
    cart = await db.carts.find_one({"session_id": session_id}, {"_id": 0})
    if not cart:
        return {"session_id": session_id, "items": [], "products": []}
    
    # Get product details for cart items
    products = []
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            products.append({**product, "quantity": item["quantity"]})
    
    return {"session_id": session_id, "items": cart.get("items", []), "products": products}

@api_router.post("/cart/{session_id}/add")
async def add_to_cart(session_id: str, item: CartItem):
    cart = await db.carts.find_one({"session_id": session_id})
    
    if not cart:
        cart = Cart(session_id=session_id, items=[item]).model_dump()
        cart['created_at'] = cart['created_at'].isoformat()
        cart['updated_at'] = cart['updated_at'].isoformat()
        await db.carts.insert_one(cart)
    else:
        items = cart.get("items", [])
        found = False
        for i, existing_item in enumerate(items):
            if existing_item["product_id"] == item.product_id:
                items[i]["quantity"] += item.quantity
                found = True
                break
        if not found:
            items.append(item.model_dump())
        
        await db.carts.update_one(
            {"session_id": session_id},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Item added to cart"}

@api_router.post("/cart/{session_id}/update")
async def update_cart_item(session_id: str, item: CartItem):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    for i, existing_item in enumerate(items):
        if existing_item["product_id"] == item.product_id:
            if item.quantity <= 0:
                items.pop(i)
            else:
                items[i]["quantity"] = item.quantity
            break
    
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/{session_id}/item/{product_id}")
async def remove_from_cart(session_id: str, product_id: str):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart.get("items", []) if item["product_id"] != product_id]
    
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/{session_id}")
async def clear_cart(session_id: str):
    await db.carts.delete_one({"session_id": session_id})
    return {"message": "Cart cleared"}

# ============== ORDERS ==============

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, user: Optional[Dict] = Depends(get_current_user)):
    # Get cart
    cart = await db.carts.find_one({"session_id": order_data.cart_session_id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and get product details
    items = []
    total = 0.0
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            item_total = product["price"] * item["quantity"]
            total += item_total
            items.append({
                "product_id": product["id"],
                "name_fr": product["name_fr"],
                "name_tr": product["name_tr"],
                "name_en": product["name_en"],
                "price": product["price"],
                "quantity": item["quantity"],
                "subtotal": item_total
            })
    
    order = Order(
        user_id=user["id"] if user else None,
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        customer_address=order_data.customer_address,
        items=items,
        total=total
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    
    return order

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/orders")
async def get_all_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    return orders

# ============== STRIPE PAYMENT ==============

@api_router.post("/checkout/session")
async def create_checkout_session(request: Request, checkout_data: CheckoutRequest):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Get order
    order = await db.orders.find_one({"id": checkout_data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Initialize Stripe
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Build URLs from origin
    origin = checkout_data.origin_url.rstrip('/')
    success_url = f"{origin}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/checkout"
    
    # Create checkout session (amount in EUR)
    checkout_request = CheckoutSessionRequest(
        amount=float(order["total"]),
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": checkout_data.order_id,
            "customer_email": order["customer_email"]
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    payment = PaymentTransaction(
        session_id=session.session_id,
        order_id=checkout_data.order_id,
        amount=float(order["total"]),
        currency="eur",
        status="pending",
        payment_status="pending",
        metadata={"order_id": checkout_data.order_id}
    )
    
    payment_doc = payment.model_dump()
    payment_doc['created_at'] = payment_doc['created_at'].isoformat()
    payment_doc['updated_at'] = payment_doc['updated_at'].isoformat()
    await db.payment_transactions.insert_one(payment_doc)
    
    # Update order with payment session id
    await db.orders.update_one(
        {"id": checkout_data.order_id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(request: Request, session_id: str):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Check if already processed
    payment = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if payment and payment.get("payment_status") == "paid":
        return payment
    
    # Initialize Stripe and get status
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    update_data = {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    # If paid, update order status
    if checkout_status.payment_status == "paid":
        if payment:
            await db.orders.update_one(
                {"id": payment["order_id"]},
                {"$set": {"status": "paid"}}
            )
    
    return {
        "session_id": session_id,
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount_total": checkout_status.amount_total,
        "currency": checkout_status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            # Update payment transaction
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "status": "complete",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Update order
            if webhook_response.metadata and webhook_response.metadata.get("order_id"):
                await db.orders.update_one(
                    {"id": webhook_response.metadata["order_id"]},
                    {"$set": {"status": "paid"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ============== CONTACT ==============

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate):
    message = ContactMessage(**message_data.model_dump())
    doc = message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    return message

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_data():
    # Check if data already exists
    existing_categories = await db.categories.count_documents({})
    if existing_categories > 0:
        return {"message": "Data already seeded"}
    
    # Create categories
    categories = [
        Category(
            id="cat-furniture",
            name_fr="Mobilier",
            name_tr="Mobilya",
            name_en="Furniture",
            slug="furniture",
            image_url="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
        ),
        Category(
            id="cat-bedroom",
            name_fr="Chambre à coucher",
            name_tr="Yatak Odası",
            name_en="Bedroom",
            slug="bedroom",
            image_url="https://images.pexels.com/photos/6903157/pexels-photo-6903157.jpeg?w=800"
        ),
        Category(
            id="cat-appliances",
            name_fr="Électroménager",
            name_tr="Ev Aletleri",
            name_en="Home Appliances",
            slug="appliances",
            image_url="https://images.unsplash.com/photo-1769326541255-c6612ab334a0?w=800"
        )
    ]
    
    for cat in categories:
        doc = cat.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.categories.insert_one(doc)
    
    # Create products
    products = [
        Product(
            id="prod-sofa-grey",
            name_fr="Canapé Moderne Gris",
            name_tr="Modern Gri Koltuk",
            name_en="Modern Grey Sofa",
            description_fr="Canapé élégant et confortable en tissu gris de haute qualité. Parfait pour votre salon moderne.",
            description_tr="Yüksek kaliteli gri kumaştan yapılmış zarif ve konforlu koltuk. Modern oturma odanız için mükemmel.",
            description_en="Elegant and comfortable sofa in high-quality grey fabric. Perfect for your modern living room.",
            price=1299.00,
            category_id="cat-furniture",
            images=["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"],
            stock=10,
            featured=True
        ),
        Product(
            id="prod-dining-table",
            name_fr="Table à Manger Design",
            name_tr="Tasarım Yemek Masası",
            name_en="Design Dining Table",
            description_fr="Table à manger moderne en bois massif avec pieds en métal noir.",
            description_tr="Siyah metal ayaklı masif ahşap modern yemek masası.",
            description_en="Modern solid wood dining table with black metal legs.",
            price=899.00,
            category_id="cat-furniture",
            images=["https://images.pexels.com/photos/2995012/pexels-photo-2995012.jpeg?w=800"],
            stock=8,
            featured=True
        ),
        Product(
            id="prod-chair-set",
            name_fr="Lot de 4 Chaises",
            name_tr="4'lü Sandalye Seti",
            name_en="Set of 4 Chairs",
            description_fr="Ensemble de 4 chaises modernes avec assise rembourrée et structure en métal.",
            description_tr="Dolgulu oturma yeri ve metal yapıya sahip 4 modern sandalye seti.",
            description_en="Set of 4 modern chairs with padded seat and metal frame.",
            price=499.00,
            category_id="cat-furniture",
            images=["https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=800"],
            stock=15,
            featured=False
        ),
        Product(
            id="prod-bed-queen",
            name_fr="Lit Queen Size avec Tête de Lit",
            name_tr="Başlıklı Çift Kişilik Yatak",
            name_en="Queen Size Bed with Headboard",
            description_fr="Lit queen size avec tête de lit capitonnée en tissu gris. Sommier inclus.",
            description_tr="Gri kumaş kapitone başlıklı çift kişilik yatak. Baza dahil.",
            description_en="Queen size bed with tufted grey fabric headboard. Base included.",
            price=1499.00,
            category_id="cat-bedroom",
            images=["https://images.pexels.com/photos/6903157/pexels-photo-6903157.jpeg?w=800"],
            stock=5,
            featured=True
        ),
        Product(
            id="prod-nightstand",
            name_fr="Table de Chevet Moderne",
            name_tr="Modern Komodin",
            name_en="Modern Nightstand",
            description_fr="Table de chevet avec tiroir et étagère ouverte. Finition bois naturel.",
            description_tr="Çekmeceli ve açık raflı komodin. Doğal ahşap finisaj.",
            description_en="Nightstand with drawer and open shelf. Natural wood finish.",
            price=199.00,
            category_id="cat-bedroom",
            images=["https://images.pexels.com/photos/6585764/pexels-photo-6585764.jpeg?w=800"],
            stock=20,
            featured=False
        ),
        Product(
            id="prod-coffee-machine",
            name_fr="Machine à Café Expresso",
            name_tr="Espresso Kahve Makinesi",
            name_en="Espresso Coffee Machine",
            description_fr="Machine à café automatique avec broyeur intégré et mousseur à lait.",
            description_tr="Entegre öğütücü ve süt köpürtücülü otomatik kahve makinesi.",
            description_en="Automatic coffee machine with integrated grinder and milk frother.",
            price=599.00,
            category_id="cat-appliances",
            images=["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800"],
            stock=12,
            featured=True
        ),
        Product(
            id="prod-tea-set",
            name_fr="Service à Thé Turc Traditionnel",
            name_tr="Geleneksel Türk Çay Seti",
            name_en="Traditional Turkish Tea Set",
            description_fr="Service à thé turc complet avec théière double et 6 verres traditionnels.",
            description_tr="Çift demlikli ve 6 geleneksel bardaklı komple Türk çay seti.",
            description_en="Complete Turkish tea set with double teapot and 6 traditional glasses.",
            price=89.00,
            category_id="cat-appliances",
            images=["https://images.pexels.com/photos/35386136/pexels-photo-35386136.jpeg?w=800"],
            stock=25,
            featured=False
        ),
        Product(
            id="prod-armchair",
            name_fr="Fauteuil Confort Premium",
            name_tr="Premium Konfor Koltuk",
            name_en="Premium Comfort Armchair",
            description_fr="Fauteuil de relaxation avec accoudoirs larges et coussin moelleux.",
            description_tr="Geniş kolçaklı ve yumuşak minderli dinlenme koltuğu.",
            description_en="Relaxation armchair with wide armrests and soft cushion.",
            price=699.00,
            category_id="cat-furniture",
            images=["https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?w=800"],
            stock=7,
            featured=False
        )
    ]
    
    for prod in products:
        doc = prod.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.products.insert_one(doc)
    
    return {"message": "Data seeded successfully", "categories": len(categories), "products": len(products)}

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "Gül Mobilya API", "version": "1.0.0"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
