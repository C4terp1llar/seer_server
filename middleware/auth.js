const cookieMiddleware = (req, res, next) => {
    const sessionID = req.cookies["JSESSIONID"];
    const xsrfToken = req.cookies["atlassian.xsrf.token"];

    if (!sessionID || !xsrfToken) {
        return res.status(401).json({ error: "Не авторизован: отсутствуют необходимые куки" });
    }

    req.headers["Cookie"] = `JSESSIONID=${sessionID}; atlassian.xsrf.token=${xsrfToken}`;

    next();
};

module.exports = cookieMiddleware;
