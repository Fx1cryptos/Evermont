<!-- coderabbit-ai-generated:v1 -->

# Evermont Django banking demo

This demo runs independently from the existing Evermont portal. It uses its own Django authentication, SQLite ledger and Redis queue. All balances are simulated.

## Start locally

Prerequisites: Python 3.12–3.14, Node.js and npm for Tailwind, and Redis for background jobs.

From the repository root:

```sh
npm ci
npm run demo:css
cd banking_demo
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py createsuperuser
.venv/bin/python manage.py runserver
```

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:4c676dab58946fbdf5d1660c81d12629ad77e4712df1bae0ccc9199076b62485 -->

Open [the dashboard](http://127.0.0.1:8000/) or [Django admin](http://127.0.0.1:8000/admin/). The public dashboard shows a sample ledger. A first sample transaction starts a private sample session in that browser. Choose **Open a simulated account** on the Accounts page to start with a zero balance. The workspace belongs to this browser session. Only Django admin accepts local staff credentials. Admin can manage users and permissions and inspect accounts and ledger entries. Balances and entries are read-only in admin so edits cannot bypass the ledger.

<!-- /coderabbit-ai-generated:v1 -->

Re-run `npm run demo:css` from the repository root after changing templates or CSS.

## Background jobs

With Redis installed, run the following in three terminals. Use one Beat scheduler per broker and database. If Redis is already running at port 6379, reuse it.

```sh
redis-server --bind 127.0.0.1 --port 6379
```

```sh
cd banking_demo
.venv/bin/celery -A evermont_demo worker --loglevel=INFO --concurrency=1
```

```sh
cd banking_demo
.venv/bin/celery -A evermont_demo beat --loglevel=INFO
```

The web app, worker and scheduler use the same `DEMO_DATABASE` and `DEMO_REDIS_URL` values. The defaults are `banking_demo/demo.sqlite3` and `redis://127.0.0.1:6379/0`. The debug server is for local development. Setting `DEMO_DEBUG=0` requires a private `DEMO_SECRET_KEY`; `DEMO_ALLOWED_HOSTS` (comma separated) and `DEMO_CSRF_TRUSTED_ORIGINS` (space separated) are configurable.

To queue a reconciliation manually from `banking_demo/`:

```sh
.venv/bin/celery -A evermont_demo call banking.tasks.post_monthly_interest
```

## Demo account terms

| Type | Annual interest rate | Deposit or withdrawal limits |
| --- | ---: | ---: |
| Savings | 4.25% | $10.00–$5,000.00 |
| Current | 0.50% | $1.00–$10,000.00 |

Celery Beat checks every day at 00:10 UTC so it can catch up after downtime. Each closed calendar month earns its closing balance multiplied by the annual rate divided by 12, rounded to the nearest cent. Interest is posted only once per account per month. Late credits retain the month they were earned and affect the running balance on their actual posting date. Report dates include both endpoints in UTC, and each transaction shows its own account’s balance immediately after posting.

Run `.venv/bin/python manage.py test` from `banking_demo/` for the application tests. They do not require Redis.

Reference: [Django database settings](https://docs.djangoproject.com/en/5.2/ref/databases/), [Celery with Django](https://docs.celeryq.dev/en/stable/django/first-steps-with-django.html), [Celery periodic tasks](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html).
