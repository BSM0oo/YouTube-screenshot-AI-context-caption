export const appStyles = `
  .app-container {
    width: 100vw;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .content-container {
    width: 100%;
    max-width: 100vw;
    padding: 0.5rem;
    margin: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .content-container.constrained {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0.5rem;
    padding-bottom: 1rem;
  }

  @media (min-width: 640px) {
    .content-container {
      padding: 1rem;
    }
    .content-container.constrained {
      padding: 2rem;
    }
  }

  .video-container {
    width: 100%;
    position: relative;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
  }

  .video-container > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;