# This file directly decrypts a capsule and ciphertext using a private key
# This is used mainly for testing and development purposes
# arguments: 
# privateKey filename

import sys
from umbral import config
from umbral.curve import SECP256K1
config.set_default_curve(SECP256K1)
from umbral import keys, signing
from umbral import pre

private_key = keys.UmbralPrivateKey.from_bytes( bytes.fromhex(sys.argv[1] ) )
public_key = private_key.get_pubkey()

filename = sys.argv[2]
filepath = "./resources/" + filename
capsules_filepath = "./resources/capsules/" + filename
ciphertexts_filepath = "./resources/ciphertexts/" + filename

with open(capsules_filepath, "rb") as capsule_file, open(ciphertexts_filepath, "rb") as ciphertext_file:

    capsule = pre.Capsule.from_bytes( capsule_file.read(), private_key.params )
    ciphertext = ciphertext_file.read()

    decrypted_data = pre.decrypt(ciphertext=ciphertext, capsule=capsule, decrypting_key=private_key)
    print(decrypted_data)