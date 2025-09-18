import time
from transformers import AutoModelForCausalLM, AutoTokenizer

print("--- CPU Inference Benchmark ---")

# Define a small, efficient model to test
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

try:
    print(f"Loading model: '{model_name}'...")
    # Load model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)

    print("✅ Model loaded successfully.")

    # Prepare the prompt
    prompt = "What are the three key principles of object-oriented programming?"
    inputs = tokenizer(prompt, return_tensors="pt")

    print("\nRunning inference test...")
    start_time = time.time()

    # Generate the output
    output_sequences = model.generate(
        input_ids=inputs["input_ids"],
        max_new_tokens=100, # Generate 100 new tokens
        do_sample=True,
        top_k=50,
        top_p=0.95
    )

    end_time = time.time()

    duration = end_time - start_time
    num_tokens = len(output_sequences[0]) - len(inputs["input_ids"][0])
    tokens_per_second = num_tokens / duration

    print(f"\n--- Benchmark Results ---")
    print(f"Time taken: {duration:.2f} seconds")
    print(f"Generated tokens: {num_tokens}")
    print(f"Performance: {tokens_per_second:.2f} tokens/second")

    if tokens_per_second < 5:
        print("\nConclusion: CPU inference is slow. For a real-time chat experience, a more optimized model (like with Llama.cpp) or a cloud-based API would be necessary.")
    else:
        print("\nConclusion: CPU inference performance is reasonable for a prototype. This is a viable option for your project's deployment.")

except Exception as e:
    print(f"\n❌ An error occurred: {e}")
    print("This might be due to a slow internet connection or insufficient RAM. Please try again.")

print("----------------------------")