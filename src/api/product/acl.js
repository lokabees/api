const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'products/*',
                methods: ['GET'],
                action: 'allow',
                view: ['description', 'title', 'picture', 'category', 'shop']
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'products/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['description', 'title', 'picture', 'category', 'shop']
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'products/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['description', 'title', 'picture', 'category', 'shop', 'author']
            }
        ]
    }
]

export default permissions
