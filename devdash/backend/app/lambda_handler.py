from mangum import Mangum

from app.main import app

# Entry point for AWS Lambda. Mangum adapts the FastAPI ASGI app to Lambda's
# event/response model.
#
# lifespan="off": the app's lifespan handler runs Base.metadata.create_all on
# startup, which we don't want firing on every cold start. The schema is created
# once against Neon during deployment setup, so we skip lifespan here to keep
# cold starts fast.
handler = Mangum(app, lifespan="off")
