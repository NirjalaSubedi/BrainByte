Quiz game (static frontend)

- Location: frontend/public/games/quiz
- Access it at: /games/quiz/index.html (when dev server or static host serves `frontend/public`)
- Behavior:
  - User selects `School` or `College`. If `College`, choose `+2` or `Bachelor`.
  - API URL can be edited in the selection screen (`/api/quiz` by default).
  - Each question has a 60-second timer. If time runs out, question is skipped.
  - API is expected to return an array of questions: [{question, options:[], answer: index, image?: url}, ...]
