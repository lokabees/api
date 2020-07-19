const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'media/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'deny',
                view: ['content', 'author', 'author.name', 'author.email']
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'media/*',
                methods: ['POST', 'DELETE'],
                action: 'allow',
                view: []
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'media/*',
                methods: ['POST', 'DELETE'],
                action: 'allow',
                view: []
            }
        ]
    }
]

export default permissions
