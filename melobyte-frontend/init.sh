soroban config identity generate admin
curl "http://localhost:8000/friendbot?addr=$(soroban config identity address admin)" 2>&1 >/dev/null
soroban lab token wrap --asset native --network standalone --source admin &

CURRENT_DIR=$(pwd)
cd ../melobyte-contract/
echo building contract
RUSTFLAGS="-C target-cpu=mvp" cargo +nightly build --target wasm32-unknown-unknown --release -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort
cd $CURRENT_DIR

echo deploying contract
CONTRACT_ID=$(soroban contract deploy --wasm ../target/wasm32-unknown-unknown/release/melobyte_contract.wasm --source admin --network standalone)

echo initializing contract $CONTRACT_ID
soroban contract invoke --id $CONTRACT_ID --source admin --network standalone -- initialize --admin $(soroban config identity address admin) --asset $(soroban lab token id --asset native --network standalone) --price 2560000000

echo $CONTRACT_ID >./contract.id

mint() {
	USERNFT=nft$1
	soroban config identity generate $USERNFT
	curl -s "http://localhost:8000/friendbot?addr=$(soroban config identity address $USERNFT)" 2>&1 >/dev/null

	soroban contract invoke --id $CONTRACT_ID --source $USERNFT --network standalone -- total_supply
	soroban contract invoke --id $CONTRACT_ID --fee 300000 --source $USERNFT --network standalone -- mint --to $(soroban config identity address $USERNFT) 2>&1 >/dev/null
}
