export type Chat = {
    chatUsers: ChatUser[];
    messages: Message[];
    createdAt: Date;
    id: number;
    isGroupChat: boolean;
    name: string;
    accessibility: string;
    password: string;
    updatedAt: Date;
};

export type ChatUser = {
    id: number;
    createdAt: Date;  // Change this from string to Date
    userId: number;
    chatId: number;
    lastReadMessageId: number | null;
    user: User;
};

export type Message = {
    id: number;
    createdAt: Date;  // Change this from string to Date
    updatedAt: Date;  // Likely need to change this too
    userId: number;
    chatId: number;
    content: string;
};


export type User = {
    id: number;
    username: string;
};
