const customFetch = ({
    url,
    onSuccess,
    onError
}) => {
    fetch(url)
    .then((res) => {
        if (res.status === 200) {
            return res.json();
        }
        throw new Error("Initial fetch failed.");
    })
    .then((data) => {
        onSuccess(data);
    })
    .catch((err) => {
        onError(err);
    });
};

export default customFetch;
