const AddToCloseFriends = async (id: number, handleFriends: (id: number) => void) => {
    try {
        const response = await fetch(`http://localhost:8080/close-friends/${id}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'appliction/json' },
        })

        if (response.ok) {
            handleFriends(id)
        }
        else {
            console.log('Error:', response);
        }
    } catch (error) {
        console.error('Request failed with status:', error);
    }
}

export default AddToCloseFriends