import { DutyType, User } from "./types";

export const classNames = (...classes: any[]): string => {
    return classes.filter(Boolean).join(' ');
}

const positionToType: Record<string, DutyType> = {
    'Steward': DutyType.waiter,
    'Cleaning Manager': DutyType.cleaning,
    'Social Chair': DutyType.social
}

export const getUserAssignType = (user: User): DutyType | undefined => positionToType[user.position || '']

export const isAssigner = (user: User): boolean => getUserAssignType(user) !== undefined