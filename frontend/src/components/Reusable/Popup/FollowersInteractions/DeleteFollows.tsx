const DeleteFollows = async (id: number, title: string, handleDelete: (id: number) => void) => {
    let link = ''
    switch (title) {
        case 'Followers':
            link = `http://localhost:8080/remove-follower/${id}`
            break
        case 'Following':
            link = `http://localhost:8080/unfollow/${id}`
            break
        case 'Close friends':
            link = `http://localhost:8080/close-friends/${id}`
            break
    }

    try {
        const response = await fetch(link, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'appliction/json' },
        })

        if (response.ok) {
            handleDelete(id)
        } else {
            console.log('Error:', response);
        }
    } catch (error) {
        console.error('Request failed with status:', error);
    }
}

export default DeleteFollows