export const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const classNames = (...classes: any[]): string => {
    return classes.filter(Boolean).join(' ');
}