export type RegisterRequestDto = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
};

export type LoginRequestDto = {
    email: string;
    password: string;
};

export type EmailDto = {
    email: string;
};

export type sendMailDto = {
    to: string;
    subject: string;
    html: string;
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

