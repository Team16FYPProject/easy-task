export interface Profile {
    first_name: string;
    last_name: string;
    email: string;
    bio: string;
    display_name: string;
    avatar: string;
}

export interface ProfileResponse extends Profile {
    task: {
        todo: number;
        doing: number;
        completed: number;
    };
}

export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
};

export type ApiFailureResponse = {
    success: false;
    data: string;
};

export type ApiResponse<T> = ApiFailureResponse | ApiSuccessResponse<T>;
