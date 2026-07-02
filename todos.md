clean up App.tsx, getBackendHealth should be in a service folder
- - -- 
res.status(200).json(await getPokemonList()); - we should have a response helper - successResponse, errorResponse, catchErrorResponse that takes in the data returned and handles the response - that way, we have more consistency on how the data is always shown on the frontend
- - -- 

