import torch

print("--- GPU Capability Assessment ---")

if torch.cuda.is_available():
    print(f"✅ GPU Found: {torch.cuda.get_device_name(0)}")

    # Get GPU properties
    properties = torch.cuda.get_device_properties(0)
    vram_gb = properties.total_memory / 1e9
    print(f"   - VRAM: {vram_gb:.2f} GB")

    # Check for Tensor Core support (important for modern model performance)
    if properties.major >= 7:
        print("   - Architecture: Supports Tensor Cores (Good for modern AI workloads)")
    else:
        print("   - Architecture: Older architecture (May have limited performance)")

    print("\nConclusion: Your system has a CUDA-enabled GPU. Fine-tuning small models locally might be possible.")

else:
    print("❌ No NVIDIA GPU found.")
    print("Conclusion: All LLM tasks will run on the CPU. Training or fine-tuning locally is not feasible. Google Colab is the correct path.")

print("---------------------------------")