export const badRequestResponse = (data: any) => {
    return Response.json(data, { status: 400 });
};

export const unauthorizedResponse = (data: any) => {
    return Response.json(data, { status: 401 });
};

export const notFoundResponse = (data: any) => {
    return Response.json(data, { status: 404 });
};

export const unprocessableResponse = (data: any) => {
    return Response.json(data, { status: 422 });
};

export const internalErrorResponse = (data: any) => {
    return Response.json(data, { status: 500 });
};

export const okResponse = (data: any) => {
    return Response.json(data, { status: 200 });
};

export const createdResponse = (data: any) => {
    return Response.json(data, { status: 201 });
};

export const acceptedResponse = (data: any) => {
    return Response.json(data, { status: 202 });
};

export const noContentResponse = (data: any) => {
    return Response.json(data, { status: 204 });
};
