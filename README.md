# dispenser-server
Server application for all Alethena services

Provides the following routes:

- `verify`: Expects an email address as input. Generates a code and sends it to the email address, the HTTP call is answered with a hashed version.