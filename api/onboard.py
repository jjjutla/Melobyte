import hashlib
from ecdsa import SigningKey, NIST256p

class BlockchainInterface:
    def __init__(self):
        self.accounts = {}
        self.flow_token_vault = 10000.0  # Hypothetical initial amount

    def create_account(self, public_key: str):
        account_id = hashlib.sha256(public_key.encode()).hexdigest()
        self.accounts[account_id] = {
            'public_key': public_key,
            'balance': 0.0
        }
        return account_id

    def fund_account(self, account_id: str, amount: float):
        if self.flow_token_vault < amount:
            raise ValueError("Insufficient funds in vault")
        self.accounts[account_id]['balance'] += amount
        self.flow_token_vault -= amount

    def add_key_to_account(self, account_id: str, public_key: str, weight: float):
        self.accounts[account_id]['public_key'] = public_key
        self.accounts[account_id]['weight'] = weight

    def get_balance(self, account_id: str):
        return self.accounts[account_id]['balance']

def create_and_setup_account(pub_key_hex: str, initial_funding_amt: float):
  
    blockchain = BlockchainInterface()
    new_account_id = blockchain.create_account(pub_key_hex)
    blockchain.add_key_to_account(new_account_id, pub_key_hex, weight=1000.0)

    if initial_funding_amt > 0.0:
        blockchain.fund_account(new_account_id, initial_funding_amt)

   
    print(f"New Account ID: {new_account_id}")
    print(f"Balance: {blockchain.get_balance(new_account_id)}")

private_key = SigningKey.generate(curve=NIST256p)
public_key = private_key.get_verifying_key()


pub_key_hex = public_key.to_string().hex()


create_and_setup_account(pub_key_hex, initial_funding_amt=10.0)
