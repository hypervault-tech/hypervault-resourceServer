# Arguments
#############################################################
# private_key signing_key receiving_public_key filename threshhold N
#############################################################
# keys are in HEX string
# filename is *just* the filename and is stored in ./resources/
# The filename is used merely to identify the kFrags

import sys
from umbral import config
from umbral.curve import SECP256K1
config.set_default_curve(SECP256K1)
from umbral import keys, signing
from umbral import pre

private_key = keys.UmbralPrivateKey.from_bytes( bytes.fromhex( sys.argv[1] ) )
public_key = private_key.get_pubkey()

signing_key = keys.UmbralPrivateKey.from_bytes( bytes.fromhex( sys.argv[2] ))
verifying_key = signing_key.get_pubkey()
signer = signing.Signer(private_key=signing_key)

receiving_public_key = keys.UmbralPublicKey.from_bytes( bytes.fromhex( sys.argv[3] ) )

filename = sys.argv[4]
kfrags_filepath = "./resources/kfrags/" + filename + "--" + receiving_public_key.to_bytes().hex()
threshhold = int( sys.argv[5])
N = int( sys.argv[6])

kfrags = pre.generate_kfrags(delegating_privkey=private_key,         \
                             signer=signer,                          \
                             receiving_pubkey=receiving_public_key,              \
                             threshold=1,                          \
                             N=1)

with open(kfrags_filepath, "wb") as kfrag_file:
    kfrag_file.write(kfrags[0].to_bytes())