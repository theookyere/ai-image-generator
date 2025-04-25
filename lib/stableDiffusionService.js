export const generateImageWithStableDiffusion = async (
  prompt, 
  apiKey, 
  options = {},
  onProgress = () => {}
) => {
  try {
    onProgress('Starting generation...', 0);
    
    // Start the prediction
    const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt,
          width: options.width || 1024,
          height: options.height || 1024,
          num_outputs: 1,
          refine: 'no_refiner',
          scheduler: 'K_EULER',
          guidance_scale: 7.5,
          num_inference_steps: 50
        }
      })
    });

    if (!startResponse.ok) {
      throw new Error(`API error: ${startResponse.status}`);
    }

    const startData = await startResponse.json();
    const predictionId = startData.id;
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // ~90 seconds with 3s delay
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      });
      
      const prediction = await statusResponse.json();
      
      // Update progress
      if (prediction.status === 'processing') {
        const percentage = Math.min(90, 10 + (attempts / maxAttempts * 80));
        onProgress('Generating image...', percentage);
      }
      
      if (prediction.status === 'succeeded') {
        onProgress('Finalizing...', 95);
        return prediction.output[0];
      }
      
      if (prediction.status === 'failed') {
        throw new Error('Image generation failed');
      }
      
      attempts++;
    }
    
    throw new Error('Generation timed out');
  } catch (error) {
    console.error('Stable Diffusion API error:', error);
    throw error;
  }
};

// Helper to track pending generations
let pendingGenerations = new Set();

export const cancelPendingGenerations = () => {
  // In a real app, we would send cancellation requests
  pendingGenerations.clear();
};
