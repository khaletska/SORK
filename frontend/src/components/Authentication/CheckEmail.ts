import { FocusEvent } from 'react';
import { TextError } from '../../models/error';

const checkEmail = (e: FocusEvent<HTMLInputElement>, setError: React.Dispatch<React.SetStateAction<TextError>>) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    let email = e.target.value
    if (!emailPattern.test(email)) {
        setError({ isError: true, text: 'Invalid email' })
    }
}

export default checkEmail