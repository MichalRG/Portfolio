from __future__ import annotations

from mangum import Mangum

from portfolio_api.main import app

handler = Mangum(app)
