export type Profile = {
    first_name: string;
    last_name: string;
    email: string;
    bio: string;
    display_name: string;
    avatar: string;
};

export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
};

export type ApiFailureResponse = {
    success: false;
    data: string;
};

export type ApiResponse<T> = ApiFailureResponse | ApiSuccessResponse<T>;
