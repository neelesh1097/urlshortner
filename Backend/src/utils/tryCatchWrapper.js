/**
 * Wraps async Express route handlers to automatically catch any thrown errors
 * and forward them to the next() error handler middleware.
 */
const wrapAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default wrapAsync;
