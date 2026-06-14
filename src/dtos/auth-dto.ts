export type RegisterRequestDto = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
};

// export type AuthUserDto = {
//     id: string;
//     first_name: string;
//     last_name: string;
//     email: string;
// };

// export type AuthResponseDto = {
//     success: true;
//     message: string;
//     token: string;
//     user: AuthUserDto;
// };

// export type ErrorResponseDto = {
//     success: false;
//     message: string;
// };