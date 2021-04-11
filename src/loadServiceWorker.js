const install = async (path) => {
  const registration = await navigator.serviceWorker.register(path);
  return new Promise((resolve, reject) => {
    registration.addEventListener("updatefound", evt => {
      const installingWorker = registration.installing;
      installingWorker.addEventListener("statechange", evt => {
        if (evt.target.state === "installed") resolve();
      });
    });
  })
}

install('worker.js').then(() => location.reload());