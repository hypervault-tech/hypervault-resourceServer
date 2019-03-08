from umbral import config
from umbral.curve import SECP256K1
config.set_default_curve(SECP256K1)
from umbral import keys, signing

private_key = keys.UmbralPrivateKey.gen_key()
public_key = private_key.get_pubkey()

signing_key = keys.UmbralPrivateKey.gen_key()
verifying_key = signing_key.get_pubkey()
signer = signing.Signer(private_key=signing_key)

print(private_key.to_bytes().hex())
print(public_key.to_bytes().hex())
print(signing_key.to_bytes().hex())