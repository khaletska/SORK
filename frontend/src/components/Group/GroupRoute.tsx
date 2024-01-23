import ErrorPage from '../ErrorPage/ErrorPage';
import GroupComponent from './GroupComponent';
import { useParams } from 'react-router-dom';

const GroupRoute = () => {
    const { id } = useParams()
    
    if (!id) return <ErrorPage statusCode={404} />

    return (
        <GroupComponent id={Number(id)} />
    )
}

export default GroupRoute