There is no password reset route. Forgot-password sends one email with a single-use link.

The token is stored only as a hash, expires, and cannot be reused.
The reply is the same whether or not that email has an account.
After a reset, other sessions for that account stop working.
The email provider has to be chosen before this ships.
Server tests must cover expiry, reuse, and the identical reply.

This row is a holdout. There is no gold patch and no test patch.
