build: build-init build-prod
build-init:
	RUSTFLAGS="-C target-cpu=mvp" cargo +nightly build \
						--target wasm32-unknown-unknown \
						--release -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort \
						--no-default-features \
						--features init
	mkdir -p ../melobyte-frontend/target
	cp ../target/wasm32-unknown-unknown/release/melobyte_contract.wasm ../melobyte-frontend/target/melobyte-init.wasm 
build-prod:
	RUSTFLAGS="-C target-cpu=mvp" cargo +nightly build \
						--target wasm32-unknown-unknown \
						--release -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort \
						--no-default-features \
						--features prod
	mkdir -p ../melobyte-frontend/target
	cp ../target/wasm32-unknown-unknown/release/melobyte_contract.wasm ../melobyte-frontend/target/melobyte-prod.wasm 


