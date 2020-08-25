const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET'],
                action: 'allow',
                view: ['name', 'slug', 'contact', 'description', 'address', 'openingHours', 'isOpen', 'author']
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['name', 'slug', 'contact', 'description', 'address', 'author', 'published', 'openingHours', 'isOpen', 'author', 'author.name', 'author.email', 'author.picture']
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['_id', 'name', 'slug', 'contact', 'description', 'address', 'author', 'published', 'openingHours', 'isOpen', 'author', 'author.name', 'author.email', 'author.picture']
            }
        ]
    }
]

export default permissions
