import './switcher.scss'

type Props = {
    options: string[],
    selectedOption: string,
    setSelectedOption: (value:string) => void,
    setBackColorGray: boolean
}

const Switcher = ({ options, selectedOption, setSelectedOption, setBackColorGray }: Props) => {
    // const [selectedOption, setSelectedOption] = useState<string>('Public')

    return (
        <div className={`switcher-wrapper ${setBackColorGray ? 'bg-gray' : 'bg-white'}`}>
            {options.map((option: string) => (
                <label className="switch-item" key={`switcher-${option}`}>
                    <input
                        type="radio"
                        name="privacy"
                        hidden
                        checked={selectedOption === option}
                        onChange={() => {
                            setSelectedOption(option)
                        }}
                    />
                    <div className="header-20 radio">
                        {option}
                    </div>
                </label>
            ))}
        </div >
    )
}

export default Switcher