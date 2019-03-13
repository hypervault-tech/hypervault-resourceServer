# Arguments
#############################################################
# private_key
#############################################################
# Output: public_key extracted from the given private_key

import sys
from umbral import config
from umbral.curve import SECP256K1
config.set_default_curve(SECP256K1)
from umbral import keys, signing
from umbral import pre

private_key = keys.UmbralPrivateKey.from_bytes( bytes.fromhex( sys.argv[1] ) )
public_key = private_key.get_pubkey()

print(public_key.to_bytes().hex())

