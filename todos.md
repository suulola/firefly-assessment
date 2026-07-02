clean up App.tsx, getBackendHealth should be in a service folder
- - -- 
res.status(200).json(await getPokemonList()); - we should have a response helper - successResponse, errorResponse, catchErrorResponse that takes in the data returned and handles the response - that way, we have more consistency on how the data is always shown on the frontend with a structure like {success: boolean, data: T, message: string }
- - -- 

use import alias rather than relative path import

--- -- - -
would be nice to have design token implemented in App.scss

- -- - - 

bloated Claude.md fix

-------

Tailwind switch

-------

sonner for toast notification

--------

performance optimization
- rather than fetch all 150 at once, fetch 10-20 and as the user scroll keep fetching more
