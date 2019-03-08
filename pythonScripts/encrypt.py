# Arguments
# secret_key signing_key filename
# Private keys are in HEX string
# filename is *just* the filename and is stored in ./resources/

import sys
from umbral import config
from umbral.curve import SECP256K1
config.set_default_curve(SECP256K1)
from umbral import keys, signing
from umbral import pre

private_key = keys.UmbralPrivateKey.from_bytes( bytes.fromhex(sys.argv[1] ) )
public_key = private_key.get_pubkey()

signing_key = keys.UmbralPrivateKey.from_bytes( bytes.fromhex(sys.argv[2] ))
verifying_key = signing_key.get_pubkey()
signer = signing.Signer(private_key=signing_key)

filename = sys.argv[3]
filepath = "./resources/" + filename
capsules_filepath = "./resources/capsules/" + filename
ciphertexts_filepath = "./resources/ciphertexts/" + filename

with open( filepath, "rb") as in_file, open(capsules_filepath, "wb") as capsule_file, \
        open(ciphertexts_filepath, "wb") as ciphertext_file:

    input_data = in_file.read()
    ciphertext, capsule = pre.encrypt(public_key, input_data)
    capsule_file.write( capsule.to_bytes() )
    ciphertext_file.write( ciphertext )
