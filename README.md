### Onix-Academy chat
```
    Chat made on express app using socket.io.
    Port - localhost:3000
```

### Sign-up
```
    curl --location --request POST 'localhost:3000/auth/sign-up' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "name": "test",
        "password": 12345678
    }'
```

### Sign-in
```
    curl --location --request POST 'localhost:3000/auth/sign-in' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "name": "test",
        "password": 12345678
    }'
```

### Chat
```
    curl --location --request GET 'localhost:3000/chat' \
    --header 'Content-Type: application/json' \
    --cookie 'id: important for getting in chat' \
```
