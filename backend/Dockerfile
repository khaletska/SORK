FROM golang:1.20
WORKDIR /backend

# Copy everything at /backend
COPY . /backend
RUN apt-get update && apt-get install -y sqlite3
RUN go mod download

RUN go build -o main .

# Expose port
EXPOSE 8080

CMD ["./main"]