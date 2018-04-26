function route(pathname, reqParamter, handle, response) {
    if (typeof handle[pathname] === 'function') {
        handle[pathname](reqParamter, response);
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 not found");
        response.end();
    }
}

exports.route = route;