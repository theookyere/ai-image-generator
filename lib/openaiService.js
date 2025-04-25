import OpenAI from 'openai';

export const generateImageWithOpenAI = async (prompt, apiKey, size = '1024x1024') => {
  if (!apiKey) throw new Error('OpenAI API key is required');
  
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Only for client-side demo
  });

  try {
    const response = await openai.images.generate({
      prompt,
      model: 'dall-e-3',
      size,
      quality: 'standard',
      n: 1,
    });

    return response.data[0].url;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};
