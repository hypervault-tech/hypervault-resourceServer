# Arguments
#############################################################
# delegating_public_key receiving_private_key delegator_verfifying_key filename
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

delegating_public_key = keys.UmbralPublicKey.from_bytes( bytes.fromhex( sys.argv[1] ) )
receiving_private_key = keys.UmbralPrivateKey.from_bytes( bytes.fromhex( sys.argv[2] ) )
receiving_public_key = receiving_private_key.get_pubkey()
delegator_verfifying_key = keys.UmbralPublicKey.from_bytes( bytes.fromhex( sys.argv[3] ) )

filename = sys.argv[4]
filepath = "./resources/" + filename
capsules_filepath = "./resources/capsules/" + filename
ciphertexts_filepath = "./resources/ciphertexts/" + filename
kfrags_filepath = "./resources/kfrags/" + filename + "--" + receiving_public_key.to_bytes().hex()
temp_filepath = "./temp/decrypted"

with open(capsules_filepath, "rb") as capsule_file, open(ciphertexts_filepath, "rb") as ciphertext_file,  \
        open(kfrags_filepath, "rb") as kfrag_file, open(temp_filepath, "wb") as temp_file:

    capsule = pre.Capsule.from_bytes( capsule_file.read(), receiving_private_key.params )
    ciphertext = ciphertext_file.read()

    kfrag = pre.KFrag.from_bytes( kfrag_file.read() )

    capsule.set_correctness_keys(delegating=delegating_public_key,          \
                                      receiving=receiving_public_key,        \
                                      verifying=delegator_verfifying_key)

    cfrag = pre.reencrypt(kfrag=kfrag, capsule=capsule)
    capsule.attach_cfrag(cfrag)
    
    decrypted = pre.decrypt(ciphertext=ciphertext, capsule=capsule, decrypting_key=receiving_private_key)

    temp_file.write(decrypted)